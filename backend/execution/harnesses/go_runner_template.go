package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// User's solve function is defined in solution.go in the same package.
// This file provides main() and the test runner.

type TestCase struct {
	ID             int    `json:"id"`
	Input          string `json:"input"`
	ExpectedOutput string `json:"expected_output"`
}

type Result struct {
	TestCaseID   int    `json:"test_case_id"`
	Passed       bool   `json:"passed"`
	ActualOutput string `json:"actual_output"`
	RuntimeMs    int64  `json:"runtime_ms"`
}

func main() {
	data, err := os.ReadFile("/runner/tests.json")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to read tests: %v\n", err)
		os.Exit(1)
	}

	var tests []TestCase
	if err := json.Unmarshal(data, &tests); err != nil {
		fmt.Fprintf(os.Stderr, "failed to parse tests: %v\n", err)
		os.Exit(1)
	}

	var results []Result
	for _, tc := range tests {
		start := time.Now()
		actual, _ := runSafe(tc.Input)
		elapsed := time.Since(start).Milliseconds()
		results = append(results, Result{
			TestCaseID:   tc.ID,
			Passed:       actual == tc.ExpectedOutput,
			ActualOutput: actual,
			RuntimeMs:    elapsed,
		})
	}

	out, err := json.Marshal(results)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to marshal results: %v\n", err)
		os.Exit(1)
	}
	fmt.Println(string(out))
}

func runSafe(input string) (output string, panicked bool) {
	defer func() {
		if r := recover(); r != nil {
			output = fmt.Sprintf("RuntimeError: panic: %v", r)
			panicked = true
		}
	}()
	return solve(input), false
}
