Feature: Gitignore

  Scenario: no additional ignores
    Given no additional ignores are provided for vcs
    When the project is lifted
    Then the gitignore file is unchanged

  @wip
  Scenario: additional directories and files
    Given additional directories are provided to be ignored from vcs
    And additional files are provided to be ignored from vcs
    When the project is lifted
    Then the additional ignores are added to the gitignore
