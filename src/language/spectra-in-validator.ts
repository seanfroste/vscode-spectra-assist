import type { ValidationAcceptor, ValidationChecks } from "langium";
import type { Person, SpectraInAstType } from "./generated/ast.js";
import type { SpectraInServices } from "./spectra-in-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SpectraInServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SpectraInValidator;
    const checks: ValidationChecks<SpectraInAstType> = {
        Person: validator.checkPersonStartsWithCapital,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SpectraInValidator {
    checkPersonStartsWithCapital(
        person: Person,
        accept: ValidationAcceptor,
    ): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept("warning", "Person name should start with a capital.", {
                    node: person,
                    property: "name",
                });
            }
        }
    }
}
