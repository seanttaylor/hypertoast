export default {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://com.hypertoast/settings.json",
    "type": "object",
    "default": {},
    "title": "The version 2 Settings Schema",
    "required": [
        "mode",
        "cookConfig",
        "notifications"
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
        "notifications": {
            "type": "object",
            "default": {},
            "title": "The notifications Schema",
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
                            "http"
                        ]
                    },
                    "examples": [
                        [
                            "http"]
                    ]
                },
                "callback": {
                    "type": "object",
                    "default": {},
                    "title": "The callback Schema",
                    "required": [
                        "href",
                        "rel"
                    ],
                    "properties": {
                        "href": {
                            "type": "string",
                            "default": "",
                            "title": "The href Schema",
                            "examples": [
                                "http://localhost:3000/api/v1/notify"
                            ]
                        },
                        "rel": {
                            "type": "string",
                            "default": "",
                            "title": "The rel Schema",
                            "examples": [
                                "http://localhost:3000/relations/notify"
                            ]
                        }
                    },
                    "examples": [{
                        "href": "http://localhost:3000/api/v1/notify",
                        "rel": "http://localhost:3000/relations/notify"
                    }]
                },
                "number": {
                    "type": "string",
                    "default": "",
                    "title": "The number Schema",
                    "examples": [
                        "2128675309"
                    ]
                }
            },
            "examples": [{
                "shouldNotify": true,
                "type": [
                    "http"
                ],
                "callback": {
                    "href": "http://localhost:3000/api/v1/notify",
                    "rel": "http://localhost:3000/relations/notify"
                },
                "number": "2128675309"
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
                "http"
            ],
            "callback": {
                "href": "http://localhost:3000/api/v1/notify",
                "rel": "http://localhost:3000/relations/notify"
            },
            "number": "2128675309"
        }
    }]
}