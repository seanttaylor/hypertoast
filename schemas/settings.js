export default {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://com.hypertoast/settings.json",
    "type": "object",
    "default": {},
    "title": "The version 2 Settings Schema",
    "required": [
        "mode",
        "cookConfig",
        "notification"
    ],
    "properties": {
        "mode": {
            "type": "string",
            "default": "",
            "title": "The mode Schema",
            "examples": [
                "bagel"
            ]
        },
        "cookConfig": {
            "type": "object",
            "default": {},
            "title": "The cookConfig Schema",
            "required": [
                "level",
                "timer"
            ],
            "properties": {
                "level": {
                    "type": "integer",
                    "default": 0,
                    "title": "The level Schema",
                    "examples": [
                        1
                    ]
                },
                "timer": {
                    "type": "object",
                    "default": {},
                    "title": "The timer Schema",
                    "required": [
                        "1",
                        "2"
                    ],
                    "properties": {
                        "1": {
                            "type": "integer",
                            "default": 0,
                            "title": "The 1 Schema",
                            "examples": [
                                50000
                            ]
                        },
                        "2": {
                            "type": "integer",
                            "default": 0,
                            "title": "The 2 Schema",
                            "examples": [
                                120000
                            ]
                        }
                    },
                    "examples": [{
                        "1": 50000,
                        "2": 120000
                    }]
                }
            },
            "examples": [{
                "level": 1,
                "timer": {
                    "1": 50000,
                    "2": 120000
                }
            }]
        },
        "notification": {
            "type": "object",
            "default": {},
            "title": "The notification Schema",
            "required": [
                "shouldNotify",
                "type"
            ],
            "properties": {
                "shouldNotify": {
                    "type": "boolean",
                    "default": false,
                    "title": "The shouldNotify Schema",
                    "examples": [
                        true
                    ]
                },
                "type": {
                    "type": "array",
                    "default": [],
                    "title": "The type Schema",
                    "items": {
                        "type": "string",
                        "default": "",
                        "title": "A Schema",
                        "examples": [
                            "sse"
                        ]
                    },
                    "examples": [
                        [
                            "sse"]
                    ]
                }
            },
            "examples": [{
                "shouldNotify": true,
                "type": [
                    "sse"
                ]
            }]
        }
    },
    "examples": [{
        "mode": "bagel",
        "cookConfig": {
            "level": 1,
            "timer": {
                "1": 50000,
                "2": 120000
            }
        },
        "notification": {
            "shouldNotify": true,
            "type": [
                "sse"
            ]
        }
    }]
}