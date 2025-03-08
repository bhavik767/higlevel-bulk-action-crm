export const ACTION_STATUS_MAPPING = {
  SKIPPED: 0,
  SUCCESS: 1,
  FAILURE: -1,
};

export enum EntityType {
  CONTACT = 'Contact',
  COMPANY = 'Company',
  LEAD = 'Lead',
  OPPORTUNITY = 'Opportunity',
  TASK = 'Task',
}

export const ENTITY_COLLECTION_NAME = {
  Contact: 'contacts',
  Company: 'companies',
  Lead: 'leads',
  Opportunity: 'opportunities',
  Task: 'tasks',
};
