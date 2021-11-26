# Jupyter.Chat Roadmap

Jupyter Chatbot aims to be a framework that analyzes Obsidian Graph data and ports those connections into a chat knowledgebase. Workflows may include parameterized call-outs to Jupyter Notebooks to return complex answers.

This roadmap represents some of the priorities for the project over the next few months. Issues or pull requests may be opened to discuss each of these items as they progress.


## Initiate the project.
- [x] Establish shell to run chat-flow.
  Worked through basic implementation of [https://github.com/kucoe/cline](cline) Shell setup.
- [x] Estalbish workflow for message processing - Send and reply to basic messages via Shell.
- [x] Process request and response workflow when bot is named in a message.
- [ ] Import private GitHUb repository using application token credentials - file checkout POC.
- [ ] Port Graph structure of Obsidian files from repo above.
  Possibly use an existing [graph data structure](https://www.npmjs.com/package/graph-data-structure#querying-the-graph) library.


## Establish testing suite.
- [x] Add JavaScript Linter and fix/refactor all files as needed.
- [x] Implement test against Chatbot shell instance.
  Using [Jest](https://jestjs.io/).
- [ ] Get active debugging working under Jest (lost-cause status?).
- [x] Build a test for happens when two extensions have the same regex signature.


## Generate Dialog worflows.

- [ ] Establish a basic document structure for an Obsidian that matches DialogFlow CX.
 