Feature: CI Providers

  Scenario: only qualified providers can be chosen
    Given the project should be versioned in git
    And the git repository will be hosted
    And CI providers can be chosen when they qualify
    When the project is scaffolded
    Then only qualified CI providers are offered
    And the qualified CI provider is scaffolded
    And the unqualified CI provider is not scaffolded

  Scenario: provider without qualify method is always offered
    Given the project should be versioned in git
    And the git repository will be hosted
    And a CI provider without a qualify method can be chosen
    When the project is scaffolded
    Then the CI provider without a qualify method is offered
    And the CI provider without a qualify method is scaffolded

  Scenario: host-aware provider qualification
    Given the project should be versioned in git
    And the repository is hosted on "Example Host"
    And a host-aware CI provider can be chosen
    When the project is scaffolded
    Then the CI provider is qualified using repository marker files
    And the host-aware CI provider is scaffolded
