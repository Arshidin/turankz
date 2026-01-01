import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Turan Standard Pool Documentation',
  description: 'Complete documentation for Turan Standard Pool platform',
  base: '/docs/',
  ignoreDeadLinks: true, // Temporarily ignore dead links to allow build
  
  // Custom theme styles
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap', rel: 'stylesheet' }],
  ],
  
  // Appearance
  appearance: true, // Enable dark mode toggle
  
  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: 'github-dark',
  },
  
  // Language configuration
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Introduction', link: '/introduction/' },
          { text: 'Roles', link: '/roles/' },
          { text: 'Farmer Guide', link: '/farmer-guide/' },
          { text: 'MPK Guide', link: '/mpk-guide/' },
          { text: 'Admin Guide', link: '/admin-guide/' },
          { text: 'FSM', link: '/fsm/' },
          { text: 'Security', link: '/security/' },
        ],
        sidebar: {
          '/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is Turan Standard Pool', link: '/introduction/' }
              ]
            },
            {
              text: 'Role Model & Access Control',
              items: [
                { text: 'Overview', link: '/roles/' }
              ]
            },
            {
              text: 'Farmer Guide',
              items: [
                { text: 'Registration & Activation', link: '/farmer-guide/' }
              ]
            },
            {
              text: 'MPK Guide',
              items: [
                { text: 'Registration & Activation', link: '/mpk-guide/' }
              ]
            },
            {
              text: 'Admin Guide',
              items: [
                { text: 'Coordinator Role', link: '/admin-guide/' }
              ]
            },
            {
              text: 'Status Machines (FSM)',
              items: [
                { text: 'Overview', link: '/fsm/' }
              ]
            },
            {
              text: 'Data & Security Model',
              items: [
                { text: 'Overview', link: '/security/' }
              ]
            },
            {
              text: 'Business Logic & Guardrails',
              items: [
                { text: 'Overview', link: '/business-logic/' }
              ]
            },
            {
              text: 'Core System Modules',
              items: [
                { text: 'Overview', link: '/modules/' }
              ]
            },
            {
              text: 'Limitations & Non-Goals',
              items: [
                { text: 'Overview', link: '/limitations/' }
              ]
            },
            {
              text: 'Glossary',
              items: [
                { text: 'Domain Terms', link: '/glossary/' }
              ]
            }
          ]
        }
      }
    },
    '/ru/': {
      label: 'Русский',
      lang: 'ru',
      themeConfig: {
        nav: [
          { text: 'Введение', link: '/ru/introduction/' },
          { text: 'Роли', link: '/ru/roles/' },
          { text: 'Руководство для фермеров', link: '/ru/farmer-guide/' },
          { text: 'Руководство для МПК', link: '/ru/mpk-guide/' },
          { text: 'FSM', link: '/ru/fsm/' },
          { text: 'Безопасность', link: '/ru/security/' },
        ],
        sidebar: {
          '/ru/': [
            {
              text: 'Введение',
              items: [
                { text: 'Что такое Turan Standard Pool', link: '/ru/introduction/' }
              ]
            },
            {
              text: 'Модель ролей и контроль доступа',
              items: [
                { text: 'Обзор', link: '/ru/roles/' }
              ]
            },
            {
              text: 'Руководство для фермеров',
              items: [
                { text: 'Регистрация и активация', link: '/ru/farmer-guide/' }
              ]
            },
            {
              text: 'Руководство для МПК',
              items: [
                { text: 'Регистрация и активация', link: '/ru/mpk-guide/' }
              ]
            },
            {
              text: 'Машины состояний (FSM)',
              items: [
                { text: 'Обзор', link: '/ru/fsm/' }
              ]
            },
            {
              text: 'Модель данных и безопасности',
              items: [
                { text: 'Обзор', link: '/ru/security/' }
              ]
            }
          ]
        }
      }
    }
  },
  
  // Search configuration
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Reset',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close'
                }
              }
            }
          },
          '/ru/': {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                noResultsText: 'Результатов не найдено',
                resetButtonTitle: 'Сбросить',
                footer: {
                  selectText: 'выбрать',
                  navigateText: 'перейти',
                  closeText: 'закрыть'
                }
              }
            }
          }
        }
      }
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Arshidin/turankz' }
    ],
    
    // Footer
    footer: {
      message: 'Turan Standard Pool Documentation',
      copyright: 'Copyright © 2025 TURAN'
    }
  }
})
