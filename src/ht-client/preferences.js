/**
 * Holds cooking program settings for the toaster; supports different settings schema versions
 */
export default {
    latest: {
      mode: 'bagel',
      cookConfig: {
        level: 1,
        timer: {
          '1': 50000,
          '2': 120000
        }
      },
      notifications: {
        shouldNotify: true,
        type: [
          'sse'
        ]
      },
      version: 'http://localhost:3010/hypertoast/schemas/settings'
    },
    v1: {
      mode: [
        'bagel'
      ],
      cookConfig: {
        level: [
          1
        ],
        timer: {
          '1': 50000
        }
      },
      version: 'http://localhost:3010/hypertoast/schemas/settings-1'
    }
  }