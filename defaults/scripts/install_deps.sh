#!/bin/bash
function install(){ 
    echo "==================================="
    echo "  Dependecy installation starting"
    echo "  Do not navigate away please..."
    echo "==================================="
    #recusively find all install_deps.sh files and execute them
    find ./scripts/Extensions -type f -name "install_deps.sh" -exec bash {} \;
    find ~/homebrew/data/Junk-Store/scripts/Extensions -type f -name "install_deps.sh" -exec bash {} \;



    echo "==================================="
    echo "  Dependecy installation complete"
    echo "==================================="
}

function uninstall(){
    echo "==================================="
    echo "  Dependecy uninstallation starting"
    echo "  Do not navigate away please..."
    echo "==================================="
    #recusively find all install_deps.sh files and execute them
    find ./scripts/Extensions -type f -name "install_deps.sh" -exec bash {} uninstall \;
    find ~/homebrew/data/Junk-Store/scripts/Extensions -type f -name "install_deps.sh" -exec bash {} uninstall \;

    echo "==================================="
    echo "  Dependecy uninstallation complete"
    echo "==================================="
}

if [ "$1" == "uninstall" ]; then
    uninstall
else
    install
fi