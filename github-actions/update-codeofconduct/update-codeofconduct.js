const { Octokit } = require("@octokit/rest");

const token = process.env.token;
const octokit = new Octokit({ auth: token });

// Copies contents of code of conduct source file and creates/updates it in designated repos
async function updateCodeOfConduct(repos) {
    const owner = 'jdingeman';
    // Gets contents of code of conduct source file
    const codeOfConductSource = await octokit.request(`GET /repos/${owner}/codeofconduct/contents/README.md`);

    const { content } = codeOfConductSource.data;

    // loops through array of provided repos
    for (let repo of repos) {
        const { name, path } = repo;
        let currentCodeOfConduct = false;

        // Checks to see if a file already exists at the designated path
        try {
            currentCodeOfConduct = await octokit.request(`GET /repos/${owner}/${name}/contents/${path}`);
        } catch (error) {
            console.log(`${error.response.url} not found`)
        }

        // Uses contents of the source file to update existing file or create a new file
        if (currentCodeOfConduct) {
            const { sha } = currentCodeOfConduct.data;
            await octokit.request(`PUT /repos/${owner}/${name}/contents/${path}`, {
                sha,
                message: 'Updating code of conduct file',
                content
            });
        } else {
            await octokit.request(`PUT /repos/${owner}/${name}/contents/${path}`, {
                message: 'Creating code of conduct file',
                content
            });
        }
    }
}

// Defines repos and corresponding paths to copy the code of conduct into
// To add additional repos, add an object to this array with the following structure:
// {
//     name: '[name of repo]',
//     path: '[path to the file you want to create/update]'
// }
    // Note:
    // The token being accessed from hackforla/codeofconduct's secrets.GHA_TOKEN
    // needs to have write access to the repositories in this repos array
const repos = [
    {
        name: 'website',
        path: '_includes/code-of-conduct-page/CODEOFCONDUCT.md'
    },
]

updateCodeOfConduct(repos);
