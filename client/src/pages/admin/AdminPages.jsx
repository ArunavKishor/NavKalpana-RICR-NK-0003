import React from "react";
import PlaceholderPage from "@/components/dashboard/PlaceholderPage";
import BatchManagement from "./BatchManagement";

const AssessmentManagement = () => (
  <PlaceholderPage title="Assessment Management" />
);
const StudentManagement = () => <PlaceholderPage title="Student Management" />;
const SupportRequests = () => <PlaceholderPage title="Support Requests" />;

export {
  BatchManagement,
  AssessmentManagement,
  StudentManagement,
  SupportRequests,
};
