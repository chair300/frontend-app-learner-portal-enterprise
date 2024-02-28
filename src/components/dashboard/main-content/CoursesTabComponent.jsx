import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  useToggle,
  Row,
  Alert,
  MediaQuery,
  breakpoints,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { CourseEnrollmentsContextProvider } from './course-enrollments';
import { MainContent, Sidebar } from '../../layout';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../../course/CourseEnrollmentFailedAlert';
import DashboardMainContent from './DashboardMainContent';
import { DashboardSidebar } from '../sidebar';

const CoursesTabComponent = ({ canOnlyViewHighlightSets }) => {
  const { state } = useLocation();
  const [isActivationAlertOpen, , closeActivationAlert] = useToggle(!!state?.activationSuccess);
  const intl = useIntl();

  return (
    <>
      <Alert
        variant="success"
        show={isActivationAlertOpen}
        onClose={closeActivationAlert}
        className="mt-3"
        dismissible
        closeLabel={intl.formatMessage({
          id: 'enterprise.dashboard.course.assignment.alert.dismiss.button',
          defaultMessage: 'Dismiss',
          description: 'Dismiss button label for the course assignment alert',
        })}
      >
        <FormattedMessage
          id="enterprise.dashboard.tab.courses.license.activated"
          defaultMessage="Your license was successfully activated."
          description="Alert message shown to a learner on enterprise dashboard courses tab."
        />
      </Alert>
      <Row className="py-5">
        <CourseEnrollmentsContextProvider>
          <CourseEnrollmentFailedAlert className="mt-0 mb-3" enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD} />
          <MainContent>
            <DashboardMainContent canOnlyViewHighlightSets={canOnlyViewHighlightSets} />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => (matches ? (
              <Sidebar data-testid="courses-tab-sidebar">
                <DashboardSidebar />
              </Sidebar>
            ) : null)}
          </MediaQuery>
        </CourseEnrollmentsContextProvider>
      </Row>
    </>
  );
};

CoursesTabComponent.propTypes = {
  canOnlyViewHighlightSets: PropTypes.bool,
};

CoursesTabComponent.defaultProps = {
  canOnlyViewHighlightSets: false,
};

export default CoursesTabComponent;
