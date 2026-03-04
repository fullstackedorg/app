if (location.search.includes("term")) {
    await import("./terminal");
} else {
    await import("./demo");
}

export {};
