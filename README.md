# An implementation of @openstad/cms for open democracy

## Prerequisites
 - [Git](https://git-scm.com/)
 - [Node.js and npm](https://nodejs.org/en/)
 - [Mongodb](https://www.mongodb.com/)


#### 1. Set .env values
copy .env.example to .env and configure the env values

#### 2. Run NPM install

```
npm i
```

#### 3. Use npm link for local development
- `cd packages/cms`
- `npm link`
- `cd ../../`
- `npm link @openstad/cms`

For more information about the @openstad/cms package see this [readme](packages/cms/README.md)

### Using Travis
Travis variables

Docker push
- DOCKER_PUBLIC_USERNAME
- DOCKER_IMAGE_NAME
- DOCKER_USERNAME
- DOCKER_PASSWORD

Kube deploy:
- KUBE_DEPLOY=true
- KUBE_CONFIG=`config`
- K8S_NAMESPACE
- K8S_DEPLOYMENT_NAME
- DEV_RELEASE_BRANCHES
- ACC_RELEASE_BRANCHES
- PROD_RELEASE_BRANCHES

Gitops flow
- GITOPS=true
- HELM_REPO_WITH_TOKEN=
- HELM_REPO_NAME=openstad-kubernetes
- HELM_CHART_FOLDER=k8s/openstad
- GITOPS_DEV_RELEASE_BRANCH=develop
- GITOPS_ACC_RELEASE_BRANCH=staging
- GITOPS_PROD_RELEASE_BRANCH=master
- GITOPS_DEV_VALUES_FILE=k8s/openstad/environments/dev.values.yaml
- GITOPS_ACC_VALUES_FILE=k8s/openstad/environments/acc.values.yaml
- GITOPS_PROD_VALUES_FILE=k8s/openstad/environments/prod.values.yaml
- DEV_RELEASE_BRANCHES=develop
- ACC_RELEASE_BRANCHES=staging
- PROD_RELEASE_BRANCHES=master
