export const loadFixtureAsJson = (fixture) => fetch(`/test/fixtures/${fixture}`).then((response) => response.json());
