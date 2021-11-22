# Jupyter.Chat Roadmap

Jupyter Chatbot aims to be a framework that analyzes Obsidian Graph data and ports those connections into a chat knowledgebase. Workflows may include parameterized call-outs to Jupyter Notebooks to return complex answers.

This roadmap represents some of the priorities for the project over the next few months. Issues or pull requests may be opened to discuss each of these items as they progress.

## Initiate the project.
- [x] Establish shell to run chat-flow.
  Worked through basic implementation of [https://github.com/kucoe/cline](cline) Shell setup.
- [x] Estalbish workflow for message processing - Send and reply to basic messages via Shell.
- [x] Process request and response workflow when bot is named in a message.
- [ ] Build out tests for variations of hear and respond ordering
  What happends when two extensions have the same signature?

## Establish testing suite.
- [x] Add JavaScript Linter and fix/refactor all files as needed.
- [x] Implement test against Chatbot shell instance.
  Using [Jest](https://jestjs.io/).
- [ ] Get active debugging working under Jest.

## Generate example worflows.

