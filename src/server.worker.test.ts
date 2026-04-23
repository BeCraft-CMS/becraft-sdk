import { parseHtmlOnServer } from './server.worker';
import { runServerParserTests } from './parser/server-parser-test-cases';

runServerParserTests('@becraft/sdk/server (workerd + linkedom/worker)', parseHtmlOnServer);
