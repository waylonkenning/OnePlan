/**
 * NZ Government Digital Target State (DTS) — asset categories and canonical assets.
 * Source: GCDO, February 2026 (dns.govt.nz)
 *
 * © Crown copyright. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
 * https://creativecommons.org/licenses/by/4.0/
 */

import { AssetCategory, Asset } from '../types';

export const DTS_CATEGORIES: AssetCategory[] = [
  { id: 'cat-dts-customer',    name: 'Customer Layer',                      order: 10 },
  { id: 'cat-dts-channels',    name: 'Channels',                            order: 11 },
  { id: 'cat-dts-dpi',         name: 'Digital Public Infrastructure',       order: 12 },
  { id: 'cat-dts-integration', name: 'Integration',                         order: 13 },
  { id: 'cat-dts-agency',      name: 'Agency, Platform & Infrastructure',   order: 14 },
  { id: 'cat-dts-platforms',   name: 'Common Consolidated Platforms',       order: 15 },
];

export const DTS_ASSETS: Asset[] = [
  // Customer Layer
  { id: 'dts-cust-01', name: 'Citizens & Residents',             categoryId: 'cat-dts-customer', alias: 'DTS.CUST.01' },
  { id: 'dts-cust-02', name: 'Businesses & Employers',           categoryId: 'cat-dts-customer', alias: 'DTS.CUST.02' },
  { id: 'dts-cust-03', name: 'Iwi & Community Organisations',    categoryId: 'cat-dts-customer', alias: 'DTS.CUST.03' },

  // Channels
  { id: 'dts-ch-01', name: 'All-of-Government Channels',            categoryId: 'cat-dts-channels',    alias: 'DTS.CH.01' },
  { id: 'dts-ch-02', name: 'Existing Agency Channels',              categoryId: 'cat-dts-channels',    alias: 'DTS.CH.02' },
  { id: 'dts-ch-03', name: 'Non-Government Channels',               categoryId: 'cat-dts-channels',    alias: 'DTS.CH.03' },

  // Digital Public Infrastructure (DPI)
  { id: 'dts-dpi-01', name: 'Identity & Credential Services',       categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.01' },
  { id: 'dts-dpi-02', name: 'AI Platform Services',                 categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.02' },
  { id: 'dts-dpi-03', name: 'AI Broker / Gateway',                  categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.03' },
  { id: 'dts-dpi-04', name: 'Notifications & Messaging System',     categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.04' },
  { id: 'dts-dpi-05', name: 'Payments Management',                  categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.05' },
  { id: 'dts-dpi-06', name: 'Semantic Search',                      categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.06' },
  { id: 'dts-dpi-07', name: 'Data Dictionary',                      categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.07' },
  { id: 'dts-dpi-08', name: 'Data & AI Safeguard',                  categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.08' },
  { id: 'dts-dpi-09', name: 'Data & Services Catalogue',            categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.09' },
  { id: 'dts-dpi-10', name: 'Rules Library',                        categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.10' },
  { id: 'dts-dpi-11', name: 'Headless Content Management System',   categoryId: 'cat-dts-dpi', alias: 'DTS.DPI.11' },

  // Integration
  { id: 'dts-int-01', name: 'Data, API and AI Services Exchange',   categoryId: 'cat-dts-integration', alias: 'DTS.INT.01' },

  // Common Consolidated Platforms
  { id: 'dts-plt-01', name: 'EAM (Enterprise Asset Management)',    categoryId: 'cat-dts-platforms', alias: 'DTS.PLT.01' },
  { id: 'dts-plt-02', name: 'ITSM (IT Service Management)',         categoryId: 'cat-dts-platforms', alias: 'DTS.PLT.02' },
  { id: 'dts-plt-03', name: 'HRIS (HR Information System)',         categoryId: 'cat-dts-platforms', alias: 'DTS.PLT.03' },
  { id: 'dts-plt-04', name: 'FMIS (Financial Management)',          categoryId: 'cat-dts-platforms', alias: 'DTS.PLT.04' },
  { id: 'dts-plt-05', name: 'Contracts Management',                 categoryId: 'cat-dts-platforms', alias: 'DTS.PLT.05' },
];
