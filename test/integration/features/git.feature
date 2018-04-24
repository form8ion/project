Feature: Git Repository

  Scenario: not a git repo

  Scenario: git repo
    Given the project should be versioned in git
    When the project is scaffolded
    Then the base git files should be present
