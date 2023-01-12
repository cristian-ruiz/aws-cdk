#!/bin/bash
set -euo pipefail

# given an aws-cdk bundle archive (the one published to github releases), extract
# all .jsii manifests and places them under "jsii/*.jsii"
# now they can be used with jsii-reflect

zip=$1

if [ -z "${zip}" ]; then
  echo "Usage: $(basename $0) <cdk-bundle-zip>"
  exit 1
fi

outdir=$PWD/jsii
mkdir -p ${outdir}

workdir=$(mktemp -d)
trap "rm -fr ${workdir}" EXIT

unzip -q ${zip} -d ${workdir} js/*.jsii.tgz

for tarball in ${workdir}/js/*.jsii.tgz; do
  basename=$(basename ${tarball} .jsii.tgz)
  (
    staging=$(mktemp -d)
    trap "rm -fr ${staging}" EXIT
    tar -xf ${tarball} -C ${staging}
    if [ -f ${staging}/package/.jsii ]; then
      echo ${basename}
      mv ${staging}/package/.jsii ${outdir}/${basename}.jsii
    fi
  )
done
