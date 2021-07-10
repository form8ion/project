Feature: Documentation

  Scenario: Simple README
    When the project is scaffolded
    Then the README includes the core details

  Scenario: README for a Public Project
    Given the project is "Public"
    When the project is scaffolded
    Then the README includes the core details
    And "Public" details are included in the README

  Scenario: README for a Private Project
    Given the project is "Private"
    When the project is scaffolded
    Then the README includes the core details
    And "Private" details are included in the README

  Scenario: Language Content in README
    Given the project is "Public"
    And a language scaffolder is chosen
    And the language scaffolder defines documentation content
    When the project is scaffolded
    Then the README includes the core details
    And the language content is included in the README
