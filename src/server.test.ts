import { parseHtmlOnServer } from './server';
import { runServerParserTests } from './parser/server-parser-test-cases';

runServerParserTests('@becraft/sdk/server (node + linkedom)', parseHtmlOnServer);
