import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import { SkillsContextProvider } from '../SkillsContextProvider';
import SearchCurrentJobCard from '../SearchCurrentJobCard';
import { useAlgoliaSearch, useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { resetMockReactInstantSearch, setFakeHits } from '../__mocks__/react-instantsearch-dom';

jest.mock('react-loading-skeleton', () => ({
  __esModule: true,
  default: (props = {}) => <div data-testid={props['data-testid']} />,
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const SearchCurrentJobCardWithContext = ({
  initialSearchState,
  initialJobsState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={initialSearchState}>
        <SkillsContextProvider initialState={initialJobsState}>
          <SearchCurrentJobCard />
        </SkillsContextProvider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const TEST_JOB_KEY = 'test-job-key';
const TEST_JOB_TITLE = 'Test Job Title';
const TEST_MEDIAN_SALARY = '100000';
const TEST_JOB_POSTINGS = '4321';
const TRANSFORMED_MEDIAN_SALARY = '$100,000';
const TRANSFORMED_JOB_POSTINGS = '4,321';

const hitObject = {
  hits: [
    {
      name: TEST_JOB_TITLE,
      objectID: TEST_JOB_KEY,
      job_postings: [
        {
          median_salary: TEST_MEDIAN_SALARY,
          unique_postings: TEST_JOB_POSTINGS,
        },
      ],
    },
  ],
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerWithHiddenLaborMarketData = enterpriseCustomerFactory({
  hide_labor_market_data: true,
});

const initialSearchState = {
  refinements: { name: [] },
  dispatch: () => null,
};

const initialJobsState = {
  state: {
    interestedJobs: hitObject.hits,
  },
  dispatch: () => null,
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAlgoliaSearch: jest.fn(),
}));

const mockAlgoliaSearch = {
  searchClient: {
    search: jest.fn(), appId: 'test-app-id',
  },
  searchIndex: {
    indexName: 'mock-index-name',
  },
};

describe('<SearchCurrentJobCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAlgoliaSearch.mockReturnValue(mockAlgoliaSearch);
    setFakeHits(hitObject.hits);
  });
  afterEach(() => {
    resetMockReactInstantSearch();
  });
  test('renders the data in job cards correctly', async () => {
    renderWithRouter(
      <SearchCurrentJobCardWithContext
        initialAppState={initialAppState}
        initialSearchState={initialSearchState}
        initialJobsState={initialJobsState}
      />,
    );
    expect(await screen.findByText(TEST_JOB_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TRANSFORMED_MEDIAN_SALARY)).toBeInTheDocument();
    expect(screen.getByText(TRANSFORMED_JOB_POSTINGS)).toBeInTheDocument();
  });

  test('does not render salary data when hideLaborMarketData is true ', async () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithHiddenLaborMarketData });
    renderWithRouter(
      <SearchCurrentJobCardWithContext
        initialAppState={initialAppState}
        initialSearchState={initialSearchState}
        initialJobsState={initialJobsState}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByText(TRANSFORMED_MEDIAN_SALARY)).not.toBeInTheDocument();
      expect(screen.queryByText(TRANSFORMED_JOB_POSTINGS)).not.toBeInTheDocument();
    });
  });
});
