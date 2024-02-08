#!/bin/bash
DOWNLOAD_LOCATION=https://github.com/ebenbruyns/legendary-flatpak/releases/latest/download/legendary.flatpak

function download_and_install() {
    cd /tmp
    flatpak --user install flathub org.gnome.Platform//45 -y
    flatpak --user install com.github.Matoking.protontricks -y
    wget $DOWNLOAD_LOCATION
    flatpak --user install legendary.flatpak -y
    rm legendary.flatpak
}

if flatpak list | grep -q "com.github.derrod.legendary"; then
    echo "legendary flatpak is installed, removing and reinstalling"
    flatpak uninstall com.github.derrod.legendary -y    
fi
download_and_install

echo "==================================="
echo "  Dependecy installation complete"
echo "==================================="
