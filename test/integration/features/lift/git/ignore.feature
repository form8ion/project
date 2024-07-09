Feature: Gitignore

  Scenario: no additional ignores
    Given the project root is already initialized as a git repository
    But no additional ignores are provided for vcs
    When the project is lifted
    Then the gitignore file is unchanged

  Scenario: additional directories and files
    Given the project root is already initialized as a git repository
    And additional directories are provided to be ignored from vcs
    And additional files are provided to be ignored from vcs
    When the project is lifted
    Then the additional ignores are added to the gitignore
