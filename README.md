# FE Base Package

Base Typescript boilerplate to build FE packages on top of it


## Available commands

- `build`: build `src` directory
- `build:cjs`: build `src` directory using `cjs` modules
- `build:esm`: build `src` directory using `esm` modules
- `storybook`: run storybook on port `9001`
- `clean`: delete `core` folder
- `lint`: run `eslint` on `src` folder
- `lint:fix`: run eslint in fixing mode on `src` folder
- `test`: run tests

Note that our `build` directory is called `core`, that way you can publish the package and using it `package-name/core/SomeComponent` like [material-ui](https://material-ui.com/)

## Get started

1. Clone the repo: `git clone https://github.com/Terminal-Systems/fe-base-pkg.git <package-name>`
2. Go to the project folder and edit the `package.json`:
	-	`name`: package name (use @org-name/pkg-name for orgs)
	-	`version`: 1.0.0
	-	`author`: list of authors
	-	`repository.url`: `git+https://github.com/<username>/<package-name>.git`
	-	`bugs.url`: `https://github.com/<username>/<package-name>/issues`
	-	`homepage`: `https://github.com/<username>/<package-name>#readme`
3. Change the git remote url (you must to create an empty github project first): 
	```
	git remote rm origin
	git remote add origin <your-new-git-remote-url>
	```

## Download last base library updates

As a result of changed the remote url for the library **you will not be able to fetch the last updates using `git pull origin`**, instead, you should use:
```
git remote add base-lib https://github.com/Terminal-Systems/fe-base-pkg.git
git checkout -b <some-temp-branch-name>/upgrade
git fetch base-lib
git merge base-lib/master
```

## Build a non React based library
If you want to create a **non** `React` based library, you should remove some dependencies that are not required. To do that, please remove the following libraries from `package.json` `devDependencies` and `peerDependencies`:
 - `@material-ui/core`
 - `prop-types`
 - `react`
 - `react-dom`
 - `@types/prop-types`
 - `@types/react`
 - `@types/react-dom`

## peerDependencies
If you need to use a package that should be provided by your host app, please adding it as a `peerDependencie` to avoid library duplications on `node_modules`.

**Important Note:** `peerDependencies` are not installed by `npm install` or `yarn install`. So in order to install `peerDependencies` on dev enviroment you can add your required package as a `peerDependencies` and `devDependencies`. Otherwise, you can use a package like `install-peers-cli`

[More Info Here](https://dev.to/yvonnickfrin/how-to-handle-peer-dependencies-when-developing-modules-18fa)

## Workflow

Our library workflow is pretty straightforward: use `develop` branch to add any new feature and `master` to publish on [npmjs.com](https://www.npmjs.com/) 

## Testing
This boilerplate is pre-configured with jest. You can run your tets with the command: `npm test`. If you need to use some of the `enzyme` render methods, please consider use the `test-utils` provided by `@material-ui/core/test-utils`:
- `createMount`
- `createShallow`
- `createRender` 

[More Info Here](https://material-ui.com/guides/testing/)

## Notes
Before commit any change, husky is going to run eslint in fixing mode, run tests and try to build the project to avoid pushing commits that break something

## Utils
- [Typescript Guide](https://basarat.gitbooks.io/typescript/)
- [Typescript docs](https://www.typescriptlang.org/docs/home.html)
- [Enzyme docs](https://airbnb.io/enzyme/)
- [Jest docs](https://jestjs.io/docs/en/getting-started)
- [NPM docs](https://docs.npmjs.com/)
