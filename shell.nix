{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    web-ext
    nodejs_22
    pnpm
    firefox-devedition
    typescript
    ungoogled-chromium
  ];
}

# vim: ts=2 sw=2 et
