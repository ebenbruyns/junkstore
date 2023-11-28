#!/bin/bash
if flatpak list | grep -q "com.github.derrod.legendary"; then
    echo "legendary flatpak is installed"
else
 cd /tmp
    wget https://github.com/ebenbruyns/legendary-flatpak/releases/download/Test-0.1/legendary.flatpak
    flatpak --user install legendary.flatpak -y
    rm legendary.flatpak
fi

echo "==================================="
echo "  Dependecy installation complete"
echo "==================================="