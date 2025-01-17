# Coding Standards

```typescript
{
  "standards": {
    "typescript": {
      "required": true,
      "returnTypes": "explicit",
      "noFloatingPromises": true,
      "namingConventions": {
        "default": ["camelCase", "PascalCase"],
        "variables": ["camelCase", "PascalCase", "UPPER_CASE"],
        "types": ["PascalCase"],
        "enums": ["UPPER_CASE"],
        "dbFields": ["snake_case"]
      }
    },
    "logging": {
      "required": true,
      "excludeSmallFunctions": true,
      "smallFunctionThreshold": 3,
      "methodEntry": {
        "format": "logMethodEntry('methodName', { args })",
        "required": true
      },
      "methodExit": {
        "format": "logMethodExit('methodName', { result })",
        "required": true
      },
      "errors": {
        "format": "logError(error instanceof Error ? error : new Error('Message'), 'context')",
        "required": true
      },
      "excludedPatterns": [
        "^(get|set)[A-Z].*$",
        "^handle(Change|Click|Submit|Delete)$",
        "^on[A-Z].*$",
        "^render[A-Z].*$",
        "^use[A-Z].*$",
        "^(map|filter|reduce)[A-Z].*$",
        "^(format|transform|validate|compute|parse)[A-Z].*$",
        "^(serialize|normalize|denormalize)[A-Z].*$",
        "^(to|from|is|has|should|can|will|did)[A-Z].*$",
        "^component.*$",
        "^anonymous$"
      ]
    },
    "testing": {
      "cypress": {
        "required": true,
        "types": ["component", "e2e"],
        "electronLogging": true
      }
    },
    "git": {
      "commitMessages": {
        "format": "single-line",
        "type": "conventional"
      }
    },
    "dependencies": {
      "packageManager": "npm",
      "versionStrategy": "latest",
      "typescript": "required",
      "javascript": "forbidden"
    }
  }
}
```

# Development Tasks