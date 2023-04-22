export default {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://com.hypertoast/settings-1.json",
    "type": "object",
    "default": {},
    "title": "The version 1 Settings Schema",
    "required": [
        "mode",
        "cookConfig"
    ],
    "properties": {
        "mode": {
            "type": "array",
            "default": [],
            "title": "The mode Schema",
            "items": {
                "type": "string",
                "default": "",
                "title": "A Schema",
                "examples": [
                    "bagel"
                ]
            },
            "examples": [
                [
                    "bagel"]
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
                    "type": "array",
                    "default": [],
                    "title": "The level Schema",
                    "items": {
                        "type": "integer",
                        "default": 0,
                        "title": "A Schema",
                        "examples": [
                            1
                        ]
                    },
                    "examples": [
                        [
                            1]
                    ]
                },
                "timer": {
                    "type": "object",
                    "default": {},
                    "title": "The timer Schema",
                    "required": [
                        "1"
                    ],
                    "properties": {
                        "1": {
                            "type": "integer",
                            "default": 0,
                            "title": "The 1 Schema",
                            "examples": [
                                50000
                            ]
                        }
                    },
                    "examples": [{
                        "1": 50000
                    }]
                }
            },
            "examples": [{
                "level": [
                    1
                ],
                "timer": {
                    "1": 50000
                }
            }]
        }
    },
    "additionalProperties": false,
    "examples": [{
        "mode": [
            "bagel"
        ],
        "cookConfig": {
            "level": [
                1
            ],
            "timer": {
                "1": 50000
            }
        }
    }]
}