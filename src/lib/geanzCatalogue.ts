/**
 * Static GEANZ (Government Enterprise Architecture NZ) Application Technology catalogue.
 * Source: https://catalogue.data.govt.nz/dataset/geanz-technologies-model
 *
 * © Crown copyright. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
 * https://creativecommons.org/licenses/by/4.0/
 *
 * Includes the 17 TAP application areas and their canonical child assets.
 * Redirects, alternative names, and explanatory entries have been excluded.
 */

export interface GeanzArea {
  alias: string;   // e.g. "TAP.01"
  name: string;    // e.g. "Corporate application area"
  assets: GeanzAssetEntry[];
}

export interface GeanzAssetEntry {
  alias: string;   // e.g. "TAP.01.01"
  name: string;    // e.g. "Financial Management Information System (FMIS) applications"
  externalId: string; // GEANZ CSV_KEY
}

export const GEANZ_CATEGORY_ID = 'cat-geanz-app-tech';

/**
 * Cross-mapping from GEANZ TAP area alias to the most relevant DTS asset alias.
 * Areas not listed here have no direct DTS mapping.
 *
 * Mapping rationale:
 *   TAP.01 Corporate          → DTS.PLT.04 FMIS (largest overlap via ERP/FMIS assets)
 *   TAP.02 Service Delivery   → DTS.DPI.04 Notifications & Messaging (citizen-facing delivery)
 *   TAP.03 Experience & UX    → DTS.CH.01 All-of-Government Channels
 *   TAP.04 Data & Info Mgmt   → DTS.DPI.07 Data Dictionary
 *   TAP.06 Integration        → DTS.INT.01 Data, API and AI Services Exchange
 *   TAP.07 Identity & Access  → DTS.DPI.01 Identity & Credential Services
 *   TAP.10 Data Sharing       → DTS.INT.01 Data, API and AI Services Exchange
 *   TAP.16 Analytics & BI     → DTS.DPI.09 Data & Services Catalogue
 *   TAP.17 Emerging Tech      → DTS.DPI.02 AI Platform Services
 */
export const GEANZ_TO_DTS_MAP: Record<string, string> = {
  'TAP.01': 'DTS.PLT.04',
  'TAP.02': 'DTS.DPI.04',
  'TAP.03': 'DTS.CH.01',
  'TAP.04': 'DTS.DPI.07',
  'TAP.06': 'DTS.INT.01',
  'TAP.07': 'DTS.DPI.01',
  'TAP.10': 'DTS.INT.01',
  'TAP.16': 'DTS.DPI.09',
  'TAP.17': 'DTS.DPI.02',
};

export const geanzAreas: GeanzArea[] = [
  {
    alias: 'TAP.01',
    name: 'Corporate application area',
    assets: [
      { alias: 'TAP.01.01', name: 'Financial Management Information System (FMIS) applications', externalId: 'CSVB294C767' },
      { alias: 'TAP.01.02', name: 'Human Resource Management applications', externalId: 'CSV9CDA5FCC' },
      { alias: 'TAP.01.03', name: 'Payroll applications', externalId: 'CSV3FF1E417' },
      { alias: 'TAP.01.04', name: 'Workforce Management applications', externalId: 'CSV0D2165F4' },
      { alias: 'TAP.01.05', name: 'Corporate Administration applications', externalId: 'CSV82BE456B' },
      { alias: 'TAP.01.06', name: 'Supply Chain Management applications', externalId: 'CSV87808FB2' },
      { alias: 'TAP.01.07', name: 'Business Continuity applications', externalId: 'CSV4D4D60C5' },
      { alias: 'TAP.01.08', name: 'Stakeholder Relationship Management', externalId: 'CSV74B69C8F' },
      { alias: 'TAP.01.09', name: 'Legal Advice applications', externalId: 'CSV760EA306' },
      { alias: 'TAP.01.10', name: 'Change Management', externalId: 'CSVDDF70970' },
      { alias: 'TAP.01.11', name: 'Risk Management', externalId: 'CSV7DE13EA3' },
      { alias: 'TAP.01.12', name: 'Corporate Performance Management', externalId: 'CSV5D04D878' },
      { alias: 'TAP.01.13', name: 'Governance applications', externalId: 'CSV7794990E' },
      { alias: 'TAP.01.14', name: 'Strategy and Planning applications', externalId: 'CSV125AB163' },
      { alias: 'TAP.01.15', name: 'Enterprise Resource Planning (ERP)', externalId: 'CSV5C9C46F0' },
      { alias: 'TAP.01.16', name: 'Asset Management applications', externalId: 'CSV71A3DD55' },
      { alias: 'TAP.01.17', name: 'Enterprise Reporting applications', externalId: 'CSVAE382E81' },
    ],
  },
  {
    alias: 'TAP.02',
    name: 'Service Delivery application area',
    assets: [
      { alias: 'TAP.02.01', name: 'Product and Service Management applications', externalId: 'CSVE28263DD' },
      { alias: 'TAP.02.02', name: 'Marketing Applications', externalId: 'CSVF1F6CBF6' },
      { alias: 'TAP.02.03', name: 'Case Management applications', externalId: 'CSVCB72B91D' },
      { alias: 'TAP.02.04', name: 'Collection and Payments applications', externalId: 'CSVF4B3A61E' },
      { alias: 'TAP.02.06', name: 'Business Rules Management applications', externalId: 'CSV4D21C66E' },
      { alias: 'TAP.02.07', name: 'Rating applications', externalId: 'CSVB02CB38B' },
      { alias: 'TAP.02.08', name: 'Storefront / Shopping Cart application', externalId: 'CSV014489A4' },
      { alias: 'TAP.02.09', name: 'Emergency Management applications', externalId: 'CSVD9FF046F' },
      { alias: 'TAP.02.10', name: 'Grants Management applications', externalId: 'CSVF67270E6' },
      { alias: 'TAP.02.11', name: 'Multi-function Line of Business applications', externalId: 'CSVBE46FF2A' },
      { alias: 'TAP.02.12', name: 'Customer Relationship Management (CRM) applications', externalId: 'CSV659E16F7' },
      { alias: 'TAP.02.13', name: 'Partner Relationship Management (PRM) applications', externalId: 'CSV1520302F' },
      { alias: 'TAP.02.14', name: 'Geospatial Information System (GIS) applications', externalId: 'CSVA6056ADC' },
    ],
  },
  {
    alias: 'TAP.03',
    name: 'Experience and Interactions application area',
    assets: [
      { alias: 'TAP.03.01', name: 'Contact Centre / Help Desk applications', externalId: 'CSV2F542150' },
      { alias: 'TAP.03.02', name: 'IVR applications', externalId: 'CSV1A972618' },
      { alias: 'TAP.03.03', name: 'Static Website applications', externalId: 'CSV7CDFB406' },
      { alias: 'TAP.03.04', name: 'Online Interactive Assistance applications', externalId: 'CSVD4AF399A' },
      { alias: 'TAP.03.05', name: 'Customer Portal Application Service', externalId: 'CSV4EDA4D6B' },
      { alias: 'TAP.03.06', name: 'Customer applications', externalId: 'CSVDB75EA40' },
      { alias: 'TAP.03.07', name: 'Translation applications', externalId: 'CSV441923AF' },
      { alias: 'TAP.03.08', name: 'Chatbot applications', externalId: 'CSV652B401D' },
      { alias: 'TAP.03.09', name: 'Web Content Management applications', externalId: 'CSV2696D177' },
      { alias: 'TAP.03.10', name: 'Personalisation applications', externalId: 'CSV6225170B' },
      { alias: 'TAP.03.11', name: 'Alerts and Notifications application', externalId: 'CSVBA645ED7' },
      { alias: 'TAP.03.12', name: 'Knowledge Base applications', externalId: 'CSVB87B0C15' },
      { alias: 'TAP.03.13', name: 'Transcription applications', externalId: 'CSV6219C0D9' },
    ],
  },
  {
    alias: 'TAP.04',
    name: 'Data and Information Management application area',
    assets: [
      { alias: 'TAP.04.01', name: 'Data and Information Architecture applications', externalId: 'CSV977855A8' },
      { alias: 'TAP.04.02', name: 'Data Governance applications', externalId: 'CSV0AC940D8' },
      { alias: 'TAP.04.03', name: 'Data Protection applications', externalId: 'CSVFE0AB6F2' },
      { alias: 'TAP.04.04', name: 'Content Management System (CMS) applications', externalId: 'CSVFBDE1DCF' },
      { alias: 'TAP.04.05', name: 'Records Management applications', externalId: 'CSVC7AAA098' },
      { alias: 'TAP.04.06', name: 'Registers applications', externalId: 'CSV7FB56350' },
      { alias: 'TAP.04.09', name: 'Digital Conversion applications', externalId: 'CSVB5CB5EE5' },
      { alias: 'TAP.04.10', name: 'Enterprise Search applications', externalId: 'CSV1795A5D9' },
    ],
  },
  {
    alias: 'TAP.05',
    name: 'End User application area',
    assets: [
      { alias: 'TAP.05.01', name: 'Productivity Suite', externalId: 'CSV8D132C56' },
      { alias: 'TAP.05.02', name: 'End User Tools', externalId: 'CSV892AFD27' },
      { alias: 'TAP.05.03', name: 'Graphics and Multimedia', externalId: 'CSV021A5621' },
      { alias: 'TAP.05.05', name: 'Mobile Applications', externalId: 'CSVFF34CC5B' },
    ],
  },
  {
    alias: 'TAP.06',
    name: 'Integration application area',
    assets: [
      { alias: 'TAP.06.01', name: 'API Management', externalId: 'CSVB339C355' },
      { alias: 'TAP.06.02', name: 'Web Services', externalId: 'CSVD851B31D' },
      { alias: 'TAP.06.04', name: 'EDI Management', externalId: 'CSV8F26A0E8' },
      { alias: 'TAP.06.07', name: 'Enterprise Service Bus (ESB)', externalId: 'CSVE50DEFAC' },
      { alias: 'TAP.06.09', name: 'Enterprise Application Integration (EAI)', externalId: 'CSVA136449F' },
      { alias: 'TAP.06.13', name: 'Gateways', externalId: 'CSV0D0FAC6D' },
      { alias: 'TAP.06.14', name: 'Application Programming Interfaces (APIs)', externalId: 'CSV67175787' },
      { alias: 'TAP.06.16', name: 'Portal', externalId: 'CSV8B84AC18' },
    ],
  },
  {
    alias: 'TAP.07',
    name: 'Identity and Access Management application area',
    assets: [
      { alias: 'TAP.07.01', name: 'Identity Governance and Accountability', externalId: 'CSV9DB5866D' },
      { alias: 'TAP.07.02', name: 'Identity Administration and Operations', externalId: 'CSV572DF0CF' },
      { alias: 'TAP.07.03', name: 'Authentication', externalId: 'CSVC5CFCFD9' },
      { alias: 'TAP.07.04', name: 'Authorisation and Access Management', externalId: 'CSV31017D52' },
      { alias: 'TAP.07.05', name: 'Enterprise Directory', externalId: 'CSV3E78E883' },
      { alias: 'TAP.07.06', name: 'Identity Interoperability', externalId: 'CSVB7F08DFC' },
      { alias: 'TAP.07.07', name: 'Identification Management', externalId: 'CSV84745CF7' },
      { alias: 'TAP.07.09', name: 'Biometrics Management', externalId: 'CSVECE76B2B' },
    ],
  },
  {
    alias: 'TAP.08',
    name: 'Security application area',
    assets: [
      { alias: 'TAP.08.01', name: 'Cryptography and Encryption', externalId: 'CSVCB240723' },
      { alias: 'TAP.08.02', name: 'Network Security', externalId: 'CSV3AB53698' },
      { alias: 'TAP.08.03', name: 'Public Key Infrastructure (PKI) Services', externalId: 'CSV28EB9D9D' },
      { alias: 'TAP.08.04', name: 'Security Policies and Controls', externalId: 'CSVA3382E71' },
      { alias: 'TAP.08.05', name: 'Digital Forensics', externalId: 'CSV2BC93A05' },
      { alias: 'TAP.08.06', name: 'Intrusion Prevention', externalId: 'CSV85CE888D' },
      { alias: 'TAP.08.07', name: 'Intrusion Detection', externalId: 'CSV5829C061' },
      { alias: 'TAP.08.08', name: 'Security Metrics and Reporting', externalId: 'CSV52E896D2' },
      { alias: 'TAP.08.09', name: 'Security Intelligence and Analysis', externalId: 'CSV7B369656' },
      { alias: 'TAP.08.10', name: 'Security Audit Trail and Capture', externalId: 'CSV4A0B9CC0' },
      { alias: 'TAP.08.11', name: 'Security Incident and Event Management', externalId: 'CSV40193523' },
      { alias: 'TAP.08.12', name: 'Security Configuration Manager', externalId: 'CSVD3677F9C' },
      { alias: 'TAP.08.13', name: 'Infrastructure Security Services', externalId: 'CSV5F4738D7' },
      { alias: 'TAP.08.14', name: 'Information Security Services', externalId: 'CSVB244367D' },
    ],
  },
  {
    alias: 'TAP.09',
    name: 'Orchestration and Workflow application area',
    assets: [
      { alias: 'TAP.09.01', name: 'Business Process Management applications', externalId: 'CSVFEB38CD6' },
      { alias: 'TAP.09.02', name: 'No Code applications', externalId: 'CSV5FE97EF7' },
      { alias: 'TAP.09.03', name: 'Low Code applications', externalId: 'CSV0C4FF68A' },
      { alias: 'TAP.09.04', name: 'Process Modelling applications', externalId: 'CSV602BDB44' },
    ],
  },
  {
    alias: 'TAP.10',
    name: 'Data Sharing and Interoperability application area',
    assets: [
      { alias: 'TAP.10.01', name: 'Syntactic Interoperability applications', externalId: 'CSV1A83FD4D' },
      { alias: 'TAP.10.02', name: 'Semantic Interoperability applications', externalId: 'CSVA860768E' },
      { alias: 'TAP.10.03', name: 'Data Transformation applications', externalId: 'CSVB80B8951' },
      { alias: 'TAP.10.04', name: 'Extract Transform and Load (ETL) applications', externalId: 'CSV236C568B' },
      { alias: 'TAP.10.05', name: 'Data Structure Dictionary applications', externalId: 'CSVB728E703' },
      { alias: 'TAP.10.06', name: 'Data Mapping applications', externalId: 'CSVE04322A1' },
      { alias: 'TAP.10.07', name: 'Data Hub applications', externalId: 'CSVACE39DCC' },
      { alias: 'TAP.10.08', name: 'Data Federation applications', externalId: 'CSV3458CF3C' },
      { alias: 'TAP.10.10', name: 'Managed File Transfer (MFT) applications', externalId: 'CSV40B307B7' },
    ],
  },
  {
    alias: 'TAP.11',
    name: 'ICT Development application area',
    assets: [
      { alias: 'TAP.11.01', name: 'Development Frameworks', externalId: 'CSVF4AA2BAB' },
      { alias: 'TAP.11.02', name: 'Development Resource Libraries', externalId: 'CSVFD3446EA' },
      { alias: 'TAP.11.03', name: 'Forms Management', externalId: 'CSVF0771E4F' },
      { alias: 'TAP.11.04', name: 'Integrated Development Environment', externalId: 'CSVD77B9356' },
      { alias: 'TAP.11.05', name: 'Mash-up Editor Application Service', externalId: 'CSVFF7C2A26' },
      { alias: 'TAP.11.06', name: 'Software Configuration Management', externalId: 'CSV296F4BEA' },
      { alias: 'TAP.11.07', name: 'Software Development Kit', externalId: 'CSVDEBF1911' },
      { alias: 'TAP.11.08', name: 'Testing', externalId: 'CSVAA3A66BF' },
      { alias: 'TAP.11.09', name: 'User Innovation Toolkit', externalId: 'CSVA4F9B9DE' },
      { alias: 'TAP.11.10', name: 'Validation', externalId: 'CSV156C3EDE' },
      { alias: 'TAP.11.11', name: 'Computer-aided Software Engineering (CASE)', externalId: 'CSV72FEBDAF' },
    ],
  },
  {
    alias: 'TAP.12',
    name: 'ICT Management application area',
    assets: [
      { alias: 'TAP.12.01', name: 'ICT Service Management (ITSM)', externalId: 'CSV027352E4' },
      { alias: 'TAP.12.02', name: 'ICT Configuration Management Database (CMDB)', externalId: 'CSV17DC6C4F' },
      { alias: 'TAP.12.03', name: 'End User Configuration Management', externalId: 'EAE5CF4E-5937-4479-9723-3E5E118EF158' },
      { alias: 'TAP.12.04', name: 'ICT Asset Management', externalId: 'CSV12_04' },
      { alias: 'TAP.12.05', name: 'ICT Capacity Management', externalId: 'CSV12_05' },
      { alias: 'TAP.12.06', name: 'ICT Availability Management', externalId: 'CSV12_06' },
      { alias: 'TAP.12.07', name: 'ICT Continuity Management', externalId: 'CSV12_07' },
      { alias: 'TAP.12.08', name: 'ICT Security Management', externalId: 'CSV12_08' },
      { alias: 'TAP.12.09', name: 'ICT Vendor Management', externalId: 'CSV12_09' },
      { alias: 'TAP.12.10', name: 'ICT Portfolio Management', externalId: 'CSV12_10' },
      { alias: 'TAP.12.11', name: 'ICT Cost Management', externalId: 'CSV12_11' },
      { alias: 'TAP.12.12', name: 'ICT Performance Management', externalId: 'CSV12_12' },
    ],
  },
  {
    alias: 'TAP.13',
    name: 'Collaboration application area',
    assets: [
      { alias: 'TAP.13.01', name: 'Email applications', externalId: 'CSV13_01' },
      { alias: 'TAP.13.02', name: 'Calendaring applications', externalId: 'CSV13_02' },
      { alias: 'TAP.13.03', name: 'Instant Messaging applications', externalId: 'CSV13_03' },
      { alias: 'TAP.13.04', name: 'Video Services applications', externalId: 'CSV13_04' },
      { alias: 'TAP.13.05', name: 'File Sharing Services applications', externalId: 'CSV13_05' },
      { alias: 'TAP.13.06', name: 'Social Software applications', externalId: 'CSV13_06' },
      { alias: 'TAP.13.07', name: 'Electronic Meeting and Collaboration applications', externalId: 'CSV13_07' },
      { alias: 'TAP.13.08', name: 'Chat applications', externalId: 'CSV13_08' },
    ],
  },
  {
    alias: 'TAP.14',
    name: 'Monitoring and Reporting application area',
    assets: [
      { alias: 'TAP.14.01', name: 'System Monitoring applications', externalId: 'CSV14_01' },
      { alias: 'TAP.14.02', name: 'Application Performance Monitoring applications', externalId: 'CSV14_02' },
      { alias: 'TAP.14.03', name: 'Network Monitoring applications', externalId: 'CSV14_03' },
      { alias: 'TAP.14.04', name: 'Log Management applications', externalId: 'CSV14_04' },
    ],
  },
  {
    alias: 'TAP.15',
    name: 'Infrastructure and Cloud application area',
    assets: [
      { alias: 'TAP.15.01', name: 'Infrastructure as a Service (IaaS)', externalId: 'CSV15_01' },
      { alias: 'TAP.15.02', name: 'Platform as a Service (PaaS)', externalId: 'CSV15_02' },
      { alias: 'TAP.15.03', name: 'Software as a Service (SaaS)', externalId: 'CSV15_03' },
    ],
  },
  {
    alias: 'TAP.16',
    name: 'Analytics and Business Intelligence (BI) application area',
    assets: [
      { alias: 'TAP.16.01', name: 'Data Warehouse applications', externalId: 'CSV16_01' },
      { alias: 'TAP.16.02', name: 'Business Intelligence Reporting applications', externalId: 'CSV16_02' },
      { alias: 'TAP.16.03', name: 'Analytics applications', externalId: 'CSV16_03' },
      { alias: 'TAP.16.04', name: 'Data Mining applications', externalId: 'CSV16_04' },
    ],
  },
  {
    alias: 'TAP.17',
    name: 'Emerging Technologies application area',
    assets: [],
  },
];
