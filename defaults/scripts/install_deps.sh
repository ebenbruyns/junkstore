#!/bin/bash

#recusively find all install_deps.sh files and execute them
find ./scripts/Extensions -type f -name "install_deps.sh" -exec bash {} \;
find ~/homebrew/data/Junk-Store/scripts/Extensions -type f -name "install_deps.sh" -exec bash {} \;



echo "==================================="
echo "  Dependecy installation complete"
echo "==================================="