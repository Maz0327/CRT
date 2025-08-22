{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x   # node + npm
    pkgs.corepack      # optional: yarn/pnpm via corepack
    pkgs.git
    pkgs.curl
  ];
}
