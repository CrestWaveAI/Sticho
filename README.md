# Sticho

This repository contains setup configurations for the **GitHub Model Context Protocol (MCP) server**.

## GitHub MCP Server Configuration Files

We have set up two configuration files in the root of the workspace:

1. **[mcp.json](file:///Users/amankumar/Aman/Sticho/mcp.json)**:
   * **For**: VS Code, JetBrains IDEs, Xcode, and Eclipse.
   * **How to use**: Copy the contents of this file into your IDE's MCP config settings and replace `YOUR_GITHUB_PAT` with your personal access token.

2. **[mcp_config.json](file:///Users/amankumar/Aman/Sticho/mcp_config.json)**:
   * **For**: Google Antigravity IDE and Claude Desktop manual setups.
   * **How to use**: Copy the contents into your global Antigravity/Claude configuration file (typically located at `~/.gemini/config/mcp_config.json`) and replace `YOUR_GITHUB_TOKEN_HERE` with your personal access token.