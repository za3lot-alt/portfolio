# n8n Setup Guide: YouTube 3-Stage Approval Pipeline

This document explains how to set up the n8n workflow for the 3-stage YouTube video approval pipeline.

## 1. Required Credentials in n8n

Before importing or activating the workflow, make sure you have created the following credentials in n8n:

*   **Notion API:** You will need a Notion integration (Internal Integration Token) that has been shared with your "Video Submissions" database. Add this as a Notion Api credential in n8n.
*   **Telegram Bot Token:** Create a bot via BotFather on Telegram to get your token. Add this as a Telegram API credential in n8n.
*   **Google Drive OAuth2:** You need Google Drive credentials to download the video file automatically. Set up OAuth2 via Google Cloud Console, enabling the Google Drive API, and add it to n8n.
*   **YouTube OAuth2 API:** To upload unlisted videos, update thumbnails, and publish the video. Enable the YouTube Data API v3 in Google Cloud Console. Create OAuth2 credentials and add them to n8n as `YouTube OAuth2 API`.

## 2. Notion Database Setup

Create a database in Notion called "Video Submissions" with the following properties (ensure exact types match):

*   **Submission ID** (Formula / ID)
*   **Video Drive Link** (URL) - Link to the raw video on Google Drive. Make sure the file is accessible (e.g. Anyone with the link can view, or accessible via the OAuth account).
*   **Thumbnail** (Files & media or URL)
*   **Title** (Title)
*   **Description** (Text)
*   **Tags** (Text - comma separated)
*   **Ad Copy** (Text)
*   **Status** (Select) - Options: `Submitted`, `Approved by Node 2`, `Unlisted on YouTube`, `Approved by Node 1`, `Approved by Node 3`, `Published`, `Rejected`
*   **YouTube Link** (URL) - n8n will fill this.
*   **YouTube Video ID** (Text) - n8n will fill this.
*   **Rejection notes** (Text)
*   **Timestamps** (Date)

**Important:** After importing the workflow, select this database inside the **Notion Trigger** node and the subsequent **Notion** nodes that update properties.

## 3. Telegram Setup (Getting Chat IDs)

The workflow needs to know the Chat IDs for Node 1 (Editor), Node 2 (You/Owner), and Node 3 (Publisher).

1.  Ask each person to start a conversation with the Telegram bot you created.
2.  Get their Chat IDs. You can do this by forwarding a message from them to `userinfobot` or `getidsbot`, or by calling the `getUpdates` Telegram API endpoint for your bot.
3.  Inside the n8n workflow, for the **Telegram** nodes, you can either:
    *   Hardcode the `chatId` field directly.
    *   Set them as environment variables / node parameters (e.g. `$parameter.NODE_1_CHAT_ID`, `$parameter.NODE_2_CHAT_ID`, `$parameter.NODE_3_CHAT_ID`).

## 4. How the Workflow Works

*   **Trigger:** The workflow runs automatically via the **Notion Trigger** node whenever a row is created or modified to have `Status = Submitted`.
*   **Wait Nodes & Webhooks:** When sending Telegram notifications, the messages include an Inline Keyboard with `Approve` and `Reject` buttons. The URL behind these buttons uses n8n's internal `$execution.resumeUrl`.
*   **Execution Pause:** After sending the notification, n8n enters a **Wait** node. It completely pauses the execution until someone clicks the approve or reject button.
*   **Continuation:** When a user clicks a button, Telegram opens the `resumeUrl` with `?action=approve` or `?action=reject`. The Wait node resumes, and a **Switch** node reads the `action` parameter to decide whether to update the status, notify the user, or proceed to upload the video!
*   **Publishing:** If all three approvals pass, an HTTP Request node directly calls the YouTube Data API `v3/videos` PUT endpoint to update `privacyStatus` from `unlisted` to `public`.

## 5. Importing the Workflow

1.  In your n8n workspace, click **Add Workflow**.
2.  Click the dots in the top right -> **Import from File**.
3.  Select the `n8n_youtube_approval_workflow.json` file.
4.  Reconnect all credentials for the respective nodes (Notion, Telegram, Google Drive, YouTube, HTTP Request).
5.  Set your database ID in the Notion nodes.
6.  Set the exact Chat IDs in the Telegram nodes.
7.  Activate the workflow!
