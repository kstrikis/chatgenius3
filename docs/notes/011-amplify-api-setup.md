# Setting Up Amplify Gen 2 API Endpoints

## Initial Test API Setup
1. Created basic test API endpoint in `/amplify/functions/api-test/`
   - Simple handler returning timestamp and message
   - No authentication required
   - Configured in `backend.ts` with CORS enabled

## OpenAI Integration Test
1. Created second test endpoint in `/amplify/functions/api-test2/`
   - Handler attempts to use OpenAI API
   - Tests environment variable access
   - Makes simple chat completion request

## Environment Variables & Secrets
1. Initially discovered Lambda couldn't access frontend's OpenAI API key
2. Environment variables for Lambda functions must be configured directly in AWS:
   - Navigate to AWS Lambda console
   - Select the function (e.g. `api-test2`)
   - Under "Configuration" tab, select "Environment variables"
   - Add `OPENAI_API_KEY` with the appropriate value
   - This method is preferred for production secrets over storing them in code
   - Changes take effect immediately without needing to redeploy
   - Note: Local sandbox environment variables don't sync with deployed Lambda functions

## Debugging Challenges

### Docker & SAM Local Issues
1. Docker mount permissions on macOS:
   - Initial error with `.aws-sam/build` directory permissions
   - Attempted VirtioFS but still had issues
   - Solution: Use `/tmp/sam-build` directory instead

### TypeScript & Module Configuration
1. ESM vs CommonJS confusion:
   - Lambda runtime supports ESM modules natively
   - Keep `"type": "module"` in package.json
   - Use `"module": "ES2020"` in tsconfig.json
   - Avoid converting to CommonJS as it's not needed

### Amplify Sandbox vs SAM Local
1. Package.json location matters:
   - Amplify sandbox fails if package.json exists in function directory
   - SAM local needs package.json in function directory
   - Solution: Keep dependencies in amplify/package.json for sandbox
   - Add function-specific package.json only when testing with SAM

### Type Imports
1. Modern TypeScript configuration:
   - Use `verbatimModuleSyntax` for explicit type imports
   - Change `import { Type }` to `import type { Type }`
   - Helps catch module/type import issues early

## Key Learnings
1. Amplify Gen 2 uses `ampx` commands, not `amplify`
2. Lambda functions need explicit environment variable configuration
3. Production secrets must be managed through AWS Lambda console
4. API Gateway configuration is handled through CDK constructs in `backend.ts`
5. Local development can use both Amplify sandbox and SAM local
   - Sandbox for quick testing
   - SAM local for more accurate Lambda environment simulation 