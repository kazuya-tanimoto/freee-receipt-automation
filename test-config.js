// Test script to validate environment configuration
const { initializeEnvironment, getEnvironmentInfo } = require('./src/lib/validation/env.ts');

console.log('🧪 Testing environment configuration...\n');

try {
  // Test environment info
  console.log('📊 Environment Info:');
  const envInfo = getEnvironmentInfo();
  console.table(envInfo);

  // Test initialization
  console.log('\n🚀 Initializing environment...');
  initializeEnvironment();
  
  console.log('\n✅ Configuration test completed successfully!');
} catch (error) {
  console.error('\n❌ Configuration test failed:', error.message);
  process.exit(1);
}