import { parseHTML } from 'linkedom';
import { makeParseHtmlOnServer } from './server-html-parser';
import { runServerParserTests } from './server-parser-test-cases';

runServerParserTests('makeParseHtmlOnServer (node + linkedom)', makeParseHtmlOnServer(parseHTML));
