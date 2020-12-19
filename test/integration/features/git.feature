Feature: Git Repository

  Scenario: not versioned
    Given the project should not be versioned in git
    When the project is scaffolded
    Then the base git files should not be present

  Scenario: to be versioned
    Given the project should be versioned in git
    When the project is scaffolded
    Then the directory is initialized as a git repository
    And the base git files should be present

  Scenario: already versioned
    Given the project root is already intialized as a git repository
    When the project is scaffolded
    Then the base git files should be present
