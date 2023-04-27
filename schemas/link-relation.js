export default {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The Link Relation Schema",
    "required": [
        "title",
        "name",
        "description",
    ],
    "properties": {
        "title": {
            "type": "string",
            "default": "",
            "title": "The title Schema",
            "examples": [
                "Device Settings"
            ]
        },
        "name": {
            "type": "string",
            "default": "",
            "title": "The name Schema",
            "examples": [
                "settings"
            ]
        },
        "description": {
            "type": "string",
            "default": "",
            "title": "The description Schema",
            "examples": [
                "The 'settings' link relation is used to provide web clients with the ability to adjust the settings of the smart toaster and to customize the functionality of the toaster to better suit their needs and preferences. Clients may adjust various settings, such as the toasting time, the level of toasting, and the type of bread that is being toasted."
            ]
        },
        "method": {
            "type": "string",
            "default": "",
            "title": "The method Schema",
            "examples": [
                "PUT"
            ]
        },
        "schema": {
            "type": "string",
            "default": "",
            "title": "The schema Schema",
            "examples": [
                "/schemas/v1/settings"
            ]
        },
        "tags": {
            "type": "string",
            "default": "",
            "title": "The tags Schema",
            "examples": [
                "/tags/settings/v3"
            ]
        },
        "headers": {
            "type": "object",
            "default": {},
            "title": "The headers Schema",
            "required": [],
            "properties": {
                "accept": {
                    "type": "array",
                    "default": [],
                    "title": "The accept Schema",
                    "items": {
                        "type": "string",
                        "title": "A Schema",
                        "examples": [
                            "application/vnd.hypertoast",
                            "schema=http://localhost:3010/schemas/settings"
                        ]
                    },
                    "examples": [
                        ["application/vnd.hypertoast",
                            "schema=http://localhost:3010/schemas/settings"
                        ]
                    ]
                }
            },
            "examples": [{
                "accept": [
                    "application/vnd.hypertoast",
                    "schema=http://localhost:3010/schemas/settings"
                ]
            }]
        }
    },
    "examples": [{
        "title": "Device Settings",
        "name": "settings",
        "description": "The 'settings' link relation is used to provide web clients with the ability to adjust the settings of the smart toaster and to customize the functionality of the toaster to better suit their needs and preferences. Clients may adjust various settings, such as the toasting time, the level of toasting, and the type of bread that is being toasted.",
        "method": "PUT",
        "schema": "/schemas/v1/settings",
        "tags": "/tags/settings/v3",
        "headers": {
            "accept": [
                "application/vnd.hypertoast",
                "schema=http://localhost:3010/schemas/settings"
            ]
        }
    }]
}