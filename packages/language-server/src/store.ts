import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments, createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { ProjectController } from './project';
import { DiskController } from '@mdx/file-system';

export const lsp = createConnection(ProposedFeatures.all);
export const documents = new TextDocuments(TextDocument);
export const projects = new ProjectController();
export const fs = new DiskController();
