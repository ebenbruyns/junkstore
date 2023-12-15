#!/bin/bash
if flatpak list | grep -q "com.github.derrod.legendary"; then
    echo "legendary flatpak is installed, removing and reinstalling"
    flatpak uninstall com.github.derrod.legendary -y
    cd /tmp
    flatpak --user install flathub org.gnome.Platform//45 -y
    wget https://github.com/ebenbruyns/legendary-flatpak/releases/download/Test-0.2/legendary.flatpak
    flatpak --user install legendary.flatpak -y
    rm legendary.flatpak
else
    cd /tmp
    flatpak --user install flathub org.gnome.Platform//45 -y
    wget https://github.com/ebenbruyns/legendary-flatpak/releases/download/Test-0.2/legendary.flatpak
    flatpak --user install legendary.flatpak -y
    rm legendary.flatpakfi

echo "==================================="
echo "  Dependecy installation complete"
echo "==================================="