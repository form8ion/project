Feature: Git Repository

  Scenario: not versioned
    Given the project should not be versioned in git
    When the project is scaffolded
    Then the base git files should not be present

  Scenario: to be versioned
    Given the project should be versioned in git
    And a language scaffolder is chosen
    When the project is scaffolded
    Then the directory is initialized as a git repository
    And the base git files should be present
    And the ignores are defined in the gitignore

  Scenario: to be versioned and hosted
    Given the project should be versioned in git
    And the git repository will be hosted
    And a language scaffolder is chosen
    When the project is scaffolded
    Then the remote origin is defined
    And the project repository is hosted on the chosen host

  Scenario: already versioned
    Given the project root is already initialized as a git repository
    And a language scaffolder is chosen
    When the project is scaffolded
    Then the base git files should be present
    And the additional ignores are added to the gitignore

  Scenario: already versioned without an existing gitignore
    Given the project root is already initialized as a git repository
    And a language scaffolder is chosen
    But there is no preexisting gitignore
    When the project is scaffolded
    Then the base git files should be present
    And the gitignore file is added
