Feature: Coverage Services

  Background:
    Given the project should be versioned in git
    And the git repository will be hosted

  Scenario: Scaffold
    Given coverage services can be chosen when they qualify
    When the project is scaffolded
    Then the chosen coverage service is configured
