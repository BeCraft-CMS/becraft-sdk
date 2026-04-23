import { parseHTML } from 'linkedom/worker';
import { makeParseHtmlOnServer } from './parser/server-html-parser';

export const parseHtmlOnServer = makeParseHtmlOnServer(parseHTML);
