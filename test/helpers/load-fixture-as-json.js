export const loadFixtureAsJson = (fixture) => fetch(`/base/test/fixtures/${fixture}`).then((response) => response.json());
