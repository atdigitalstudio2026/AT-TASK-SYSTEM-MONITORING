/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Project, Category, UserProfile, NotificationItem } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_aura_brand',
    name: 'Aura Luxury Apparel',
    description: 'Fall/Winter 2026 omni-channel global campaign & lifestyle lookbook',
    color: '#3B82F6',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_nexus_tech',
    name: 'Nexus OS Mobile Launch',
    description: 'Product marketing UI assets, keynote motion, and landing experience',
    color: '#8B5CF6',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_ecoglow',
    name: 'EcoGlow Skincare',
    description: 'Sustainable product packaging, organic 3D render mockups & retail displays',
    color: '#10B981',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj_hyperdrive',
    name: 'HyperDrive FinTech',
    description: 'Brand identity system, corporate visual assets & investor deck infographics',
    color: '#F59E0B',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_brand_id', name: 'Brand Identity & Guidelines', type: 'DESIGN' },
  { id: 'cat_packaging', name: 'Packaging & Print collateral', type: 'DESIGN' },
  { id: 'cat_social_ui', name: 'Social Graphics & Carousels', type: 'BOTH' },
  { id: 'cat_motion', name: 'Motion Graphics & 3D Video', type: 'DESIGN' },
  { id: 'cat_ui_ux', name: 'Web & App Design Kit', type: 'DESIGN' },
  { id: 'cat_copywriting', name: 'Campaign Copy & Brand Story', type: 'CONTENT' }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.creative@atstudio.internal',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.design@atstudio.internal',
    role: 'DESIGNER',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_kai',
    name: 'Kai Nakamura',
    email: 'kai.3d@atstudio.internal',
    role: 'DESIGNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_sophia',
    name: 'Sophia Chen',
    email: 'sophia.content@atstudio.internal',
    role: 'CONTENT_CREATOR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_at_101',
    taskCode: 'AT-101',
    title: 'Aura Fall Lookbook Key Visuals & Typography Grid',
    projectId: 'proj_aura_brand',
    projectName: 'Aura Luxury Apparel',
    categoryId: 'cat_brand_id',
    categoryName: 'Brand Identity & Guidelines',
    taskType: 'Key Visual Design',
    requester: 'Marketing VP',
    assignedUserId: 'user_elena',
    assignedUserName: 'Elena Rostova',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    designBrief: 'Produce 4 hero editorial layouts showcasing the Autumn monochromatic wool line. Keep typography stark, high contrast serif headings paired with minimal neutral layouts.',
    figmaUrl: 'https://figma.com/@atstudio/aura-fall-lookbook',
    assetsUrl: 'https://drive.google.com/drive/folders/aura-raw-photo-assets',
    specsDimensions: '1920x1080 (Hero Web) & 1080x1350 (IG Portrait)',
    fileFormat: 'Figma + WebP (sRGB) + PDF Print',
    checklist: [
      { id: 'chk_1', title: 'Art direction moodboard & tone approved', completed: true },
      { id: 'chk_2', title: 'Curate high-res photography selects', completed: true },
      { id: 'chk_3', title: 'Typeset editorial grid in Figma', completed: false },
      { id: 'chk_4', title: 'Export web & print packages', completed: false }
    ],
    comments: [
      {
        id: 'c_1',
        authorName: 'Marcus Vance',
        authorRole: 'MANAGER',
        text: 'Pastikan kontras teks di atas foto model outerwear tetap terbaca minimal rasio 4.5:1.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        type: 'comment'
      }
    ],
    revisionCount: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_at_102',
    taskCode: 'AT-102',
    title: 'Nexus OS App Launch Keynote 3D Hardware Teaser',
    projectId: 'proj_nexus_tech',
    projectName: 'Nexus OS Mobile Launch',
    categoryId: 'cat_motion',
    categoryName: 'Motion Graphics & 3D Video',
    taskType: 'Motion Graphics & 3D Video',
    requester: 'Product Strategy Lead',
    assignedUserId: 'user_kai',
    assignedUserName: 'Kai Nakamura',
    priority: 'URGENT',
    status: 'UNDER_REVIEW',
    createdDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    designBrief: '15-second cinematic render of the titanium chassis rotating with luminous interface holographic projection. Sound synced to haptic beats.',
    figmaUrl: 'https://figma.com/@atstudio/nexus-teaser-storyboard',
    assetsUrl: 'https://drive.google.com/drive/folders/nexus-3d-renders',
    specsDimensions: '3840x2160 (4K UHD) @ 60fps',
    fileFormat: 'ProRes 422HQ + MP4 H.265',
    checklist: [
      { id: 'chk_201', title: '3D CAD geometry clean up', completed: true },
      { id: 'chk_202', title: 'Hologram shader & lighting pass', completed: true },
      { id: 'chk_203', title: 'Audio sync with sound design team', completed: true },
      { id: 'chk_204', title: 'Keynote master delivery export', completed: false }
    ],
    comments: [
      {
        id: 'c_2',
        authorName: 'Kai Nakamura',
        authorRole: 'DESIGNER',
        text: 'Render draft resolusi 4K telah diupload ke review drive. Menunggu approval Marcus.',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        type: 'comment'
      }
    ],
    revisionCount: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_at_103',
    taskCode: 'AT-103',
    title: 'EcoGlow Serum Amber Bottle Biodegradable Packaging',
    projectId: 'proj_ecoglow',
    projectName: 'EcoGlow Skincare',
    categoryId: 'cat_packaging',
    categoryName: 'Packaging & Print collateral',
    taskType: 'Packaging Mockup',
    requester: 'Sustainability Director',
    assignedUserId: 'user_elena',
    assignedUserName: 'Elena Rostova',
    priority: 'MEDIUM',
    status: 'REVISION',
    createdDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    designBrief: 'Client feedback: Adjust foil embossing on the gold botanical seal. Ensure font point size passes EU labeling compliance (min 6pt on ingredient panel).',
    figmaUrl: 'https://figma.com/@atstudio/ecoglow-packaging-dieline',
    assetsUrl: 'https://drive.google.com/drive/folders/ecoglow-print-ready',
    specsDimensions: '50ml Bottle Dieline (120x45mm)',
    fileFormat: 'Adobe Illustrator .AI + Print PDF (CMYK 300DPI)',
    checklist: [
      { id: 'chk_301', title: 'Dieline vector template setup', completed: true },
      { id: 'chk_302', title: 'EU ingredient font compliance (6pt)', completed: false },
      { id: 'chk_303', title: 'Foil embossing vector separation', completed: false }
    ],
    comments: [
      {
        id: 'c_3',
        authorName: 'Sustainability Director',
        authorRole: 'MANAGER',
        text: 'Tolong sesuaikan ukuran font pada panel komposisi agar sesuai regulasi BPOM & EU.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        type: 'revision'
      }
    ],
    revisionCount: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task_at_104',
    taskCode: 'AT-104',
    title: 'HyperDrive Investor Pitch Deck Typography & Charts',
    projectId: 'proj_hyperdrive',
    projectName: 'HyperDrive FinTech',
    categoryId: 'cat_brand_id',
    categoryName: 'Brand Identity & Guidelines',
    taskType: 'Presentation Deck',
    requester: 'CEO Office',
    assignedUserId: 'user_sophia',
    assignedUserName: 'Sophia Chen',
    priority: 'HIGH',
    status: 'APPROVED',
    createdDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    deadline: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    designBrief: '22-slide deck featuring clean FinTech data diagrams, valuation curves, and executive leadership bios. Completed and approved by Marcus.',
    figmaUrl: 'https://figma.com/@atstudio/hyperdrive-deck',
    assetsUrl: 'https://drive.google.com/drive/folders/hyperdrive-pitch-deck-pdf',
    specsDimensions: '1920x1080 (16:9 Landscape Widescreen)',
    fileFormat: 'Figma Slides + Interactive PDF + Keynote',
    checklist: [
      { id: 'chk_401', title: 'Information architecture & slide outline', completed: true },
      { id: 'chk_402', title: 'Vector chart components & data viz', completed: true },
      { id: 'chk_403', title: 'Executive slide deck review', completed: true },
      { id: 'chk_404', title: 'Final PDF signed off', completed: true }
    ],
    comments: [
      {
        id: 'c_4',
        authorName: 'Marcus Vance',
        authorRole: 'MANAGER',
        text: 'Desain deck sangat rapi dan siap dipresentasikan ke investor. Excellent work Sophia!',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        type: 'approval'
      }
    ],
    revisionCount: 1,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'all',
    title: 'New Revision Requested: AT-103',
    message: 'Sustainability Director requested packaging ingredient compliance update.',
    type: 'revision',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'all',
    title: 'Task Approved: AT-104',
    message: 'HyperDrive Investor Pitch Deck was approved by Marcus Vance.',
    type: 'approval',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];
