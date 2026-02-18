// TODO: Replace with your actual GitHub Client ID
const CLIENT_ID = "175231928f47d8d36b2d";

export async function githubDeviceFlow(
    write: (data: string) => void
): Promise<{ username: string; password: string } | null> {
    try {
        // Step 1: Request device code
        const response = await fetch("https://github.com/login/device/code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                scope: "repo,read:user"
            })
        });

        if (!response.ok)
            throw new Error(
                `Failed to initiate device flow: ${response.statusText}`
            );

        const data = await response.json();
        const {
            device_code,
            user_code,
            verification_uri,
            interval,
            expires_in
        } = data;

        write(
            `\r\nPlease visit ${verification_uri} and enter code: ${user_code}`
        );
        write(`\r\nWaiting for authentication... (expires in ${expires_in}s)`);

        // Step 2: Poll for token
        const startTime = Date.now();
        let pollInterval = (interval || 5) * 1000;

        while (Date.now() - startTime < expires_in * 1000) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));

            const tokenResponse = await fetch(
                "https://github.com/login/oauth/access_token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        client_id: CLIENT_ID,
                        device_code: device_code,
                        grant_type:
                            "urn:ietf:params:oauth:grant-type:device_code"
                    })
                }
            );

            const tokenData = await tokenResponse.json();

            if (tokenData.access_token) {
                write("\r\nSuccessfully authenticated!");

                // Fetch user data
                const userResponse = await fetch(
                    "https://api.github.com/user",
                    {
                        headers: {
                            Authorization: `token ${tokenData.access_token} `,
                            Accept: "application/json"
                        }
                    }
                );
                const userData = await userResponse.json();

                if (userData.login) {
                    write(`\r\nLogged in as ${userData.login} `);
                    return {
                        username: userData.login,
                        password: tokenData.access_token
                    };
                }

                return { username: "oauth2", password: tokenData.access_token };
            }

            if (tokenData.error === "authorization_pending") {
                // Continue polling
            } else if (tokenData.error === "slow_down") {
                pollInterval += 5000;
            } else if (tokenData.error === "expired_token") {
                write("\r\nToken expired. Please try again.");
                return null;
            } else if (tokenData.error) {
                throw new Error(tokenData.error_description || tokenData.error);
            }
        }

        return null;
    } catch (e: any) {
        write(`\r\nGitHub Auth Error: ${e.message} `);
        return null;
    }
}
