import { AppContext } from '@edx/frontend-platform/react';
import { renderHook, screen } from '@testing-library/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import HighlightedContentCard from '../HighlightedContentCard';
import { renderWithRouter } from '../../../../utils/tests';
import { useHighlightedContentCardData } from '../data';
import { useEnterpriseCustomer } from '../../../app/data';

const mockHighlightSetTitle = 'Test Highlight Set';
const mockHighlightedContentItemTitle = 'Demonstration Course';
const mockHighlightedContentItem = {
  contentKey: 'edX+DemoX',
  contentType: 'course',
  title: mockHighlightedContentItemTitle,
  cardImageUrl: 'https://fake.image',
  authoringOrganizations: [{ name: 'Test-123', logoImageUrl: 'https://fake.image' }],
  aggregationKey: 'course:edX+DemoX',
  variant: 'default',
};
const mockHighlightSet = {
  uuid: 'test-highlightset-uuid',
  highlightedContent: mockHighlightedContentItem,
  title: mockHighlightSetTitle,
};
jest.mock('../data');
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn().mockReturnValue(false),
}));
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test-enterprise-slug',
  uuid: 'test-enterprise-uuid',
};

const defaultAppContextValue = {
  authenticatedUser: { username: 'test-username' },
};

describe('HighlightedContentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('renders with data', () => {
    useHighlightedContentCardData.mockReturnValue({
      variant: 'light',
      title: mockHighlightedContentItemTitle,
      cardImageUrl: 'https://fake.image',
      authoringOrganizations: [{ name: 'Test-123', logoImageUrl: 'https://fake.image' }],
      contentType: 'Course',
      href: 'https://fake.url',
      aggregationKey: 'course:edX+DemoX',
    });

    renderWithRouter(
      <AppContext.Provider value={defaultAppContextValue}>
        <HighlightedContentCard highlightedContent={mockHighlightSet.highlightedContent} />
      </AppContext.Provider>,
    );

    // render the useHighlightedContentCardData hook
    const { result } = renderHook(() => useHighlightedContentCardData({
      enterpriseSlug: 'test-enterprise-slug',
      highlightedContent: mockHighlightSet.highlightedContent,
    }));

    expect(result.current.title).toBe(mockHighlightedContentItemTitle);
    expect(result.current.cardImageUrl).toBe('https://fake.image');
    expect(result.current.authoringOrganizations).toEqual([{ name: 'Test-123', logoImageUrl: 'https://fake.image' }]);
    expect(result.current.contentType).toBe('Course');
    expect(result.current.href).toBe('https://fake.url');
    expect(result.current.aggregationKey).toBe('course:edX+DemoX');
    expect(result.current.variant).toBe('light');
  });
  it('renders nothing when no href is passed', async () => {
    const user = userEvent.setup();
    useHighlightedContentCardData.mockReturnValue({
      variant: 'light',
      title: mockHighlightedContentItemTitle,
      cardImageUrl: 'https://fake.image',
      authoringOrganizations: [{ name: 'Test-123', logoImageUrl: 'https://fake.image' }],
      contentType: 'Course',
      aggregationKey: 'course:edX+DemoX',
    });

    renderWithRouter(
      <AppContext.Provider value={defaultAppContextValue}>
        <HighlightedContentCard highlightSetUUID="test-set" highlightedContent={{ ...mockHighlightSet.highlightedContent, href: undefined }} />
      </AppContext.Provider>,
    );

    const { result } = renderHook(() => useHighlightedContentCardData({
      enterpriseSlug: 'test-enterprise-slug',
      highlightedContent: mockHighlightSet.highlightedContent,
    }));

    expect(result.current.title).toBe(mockHighlightedContentItemTitle);
    expect(result.current.cardImageUrl).toBe('https://fake.image');
    expect(result.current.authoringOrganizations).toEqual([{ name: 'Test-123', logoImageUrl: 'https://fake.image' }]);
    expect(result.current.contentType).toBe('Course');
    expect(result.current.aggregationKey).toBe('course:edX+DemoX');
    expect(result.current.variant).toBe('light');

    const button = screen.getByText(mockHighlightedContentItemTitle);
    await user.click(button);
    expect(sendEnterpriseTrackEvent).not.toHaveBeenCalled();
  });
  it('sends track event', async () => {
    const user = userEvent.setup();
    useHighlightedContentCardData.mockReturnValue({
      variant: 'light',
      title: mockHighlightedContentItemTitle,
      cardImageUrl: 'https://fake.image',
      authoringOrganizations: [{ name: 'Test-123', logoImageUrl: 'https://fake.image' }],
      contentType: 'Course',
      href: 'https://fake.url',
      aggregationKey: 'course:edX+DemoX',
    });

    renderWithRouter(
      <AppContext.Provider value={defaultAppContextValue}>
        <HighlightedContentCard highlightSetUUID="test-set" highlightedContent={mockHighlightSet.highlightedContent} />
      </AppContext.Provider>,
    );

    const { result } = renderHook(() => useHighlightedContentCardData({
      enterpriseSlug: 'test-enterprise-slug',
      highlightedContent: mockHighlightSet.highlightedContent,
    }));

    expect(result.current.title).toBe(mockHighlightedContentItemTitle);
    expect(result.current.cardImageUrl).toBe('https://fake.image');
    expect(result.current.authoringOrganizations).toEqual([{ name: 'Test-123', logoImageUrl: 'https://fake.image' }]);
    expect(result.current.contentType).toBe('Course');
    expect(result.current.href).toBe('https://fake.url');
    expect(result.current.aggregationKey).toBe('course:edX+DemoX');
    expect(result.current.variant).toBe('light');

    const button = screen.getByText(mockHighlightedContentItemTitle);
    await user.click(button);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
