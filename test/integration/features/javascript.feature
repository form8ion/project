Feature: JavaScript Project

  @wip
  Scenario: simple
    Given the project should be versioned in git
    And the project language should be JavaScript
    When the project is scaffolded
    Then JavaScript ignores are defined
