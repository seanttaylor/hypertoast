/**
 * Holds cooking program settings for the toaster; supports different settings schema versions
 */
export default {
    '0.0.2': {
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
    },
    '0.0.1': {
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
    }
  }