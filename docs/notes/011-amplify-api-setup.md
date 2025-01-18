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

## Key Learnings
1. Amplify Gen 2 uses `ampx` commands, not `amplify`
2. Lambda functions need explicit environment variable configuration
3. Production secrets must be managed through AWS Lambda console
4. API Gateway configuration is handled through CDK constructs in `backend.ts` 