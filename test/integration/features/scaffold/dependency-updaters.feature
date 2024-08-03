Feature: Dependency Updaters

  Scenario: Registered updater
    Given the project should be versioned in git
    And the git repository will be hosted
    And a dependency updater can be chosen
    When the project is scaffolded
    Then the dependency updater was executed

  Scenario: Registered updater but not a git repo
    Given the project should not be versioned in git
    And a dependency updater can be chosen
    When the project is scaffolded
    Then the dependency updater was not executed
