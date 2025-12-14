import { promises as fs } from "node:fs";
import * as path from "node:path";
import { MemoryPatchData, MemoryPatchOperation, UserMemory, UserMemoryItem } from "../type/types";

export class UserMemoryModifier
{
    private data: UserMemory;

    constructor(userMemory: string)
    {
        this.data = userMemory.length != 0
            ? JSON.parse(userMemory) as UserMemory
            :
            {
                schema_version: 1,
                user_id: "",
                updated_at: "",
                items:
                {
                    facts: [],
                    preferences: [],
                    projects: [],
                    constraints: [],
                },
                discarded: []
            };
    }

    public ApplyPatch(patch: MemoryPatchData)
    {
        for (const operationItem of patch.ops)
        {
            const section = this.GetSection(operationItem.section);
            if (section == null)
            {
                continue;
            }

            if (operationItem.op == "add")
            {
                const id = globalThis.crypto.randomUUID();
                section?.push(
                {
                    key: id,
                    text: operationItem.text,
                    confidence: operationItem.confidence,
                    ttl: operationItem.ttl,
                    evidence: operationItem.evidence
                });
            }
            else if (operationItem.op == "update")
            {
                if (operationItem.id == null) { continue;}
                const index = this.FindIndexById(operationItem.id, section);
                if (index == -1) { continue; }

                section[index] = 
                {
                    key: operationItem.id,
                    text: operationItem.text,
                    confidence: operationItem.confidence,
                    ttl: operationItem.ttl,
                    evidence: operationItem.evidence
                }
            }
            else if (operationItem.op == "delete")
            { 
                if (operationItem.id == null) { continue;}
                const index = this.FindIndexById(operationItem.id, section);
                if (index == -1) { continue; }
                
                section.splice(index, 1);
            }
        }

        this.data.user_id = patch.user_id;
        this.data.updated_at = new Date().toISOString();
    }

    private GetSection(sectionName: string)
    {
        switch (sectionName)
        {
            case "StableFacts": return this.data.items.facts;
            case "Preferences": return this.data.items.preferences;
            case "Projects": return this.data.items.projects;
            case "Constraints": return this.data.items.constraints;
        }
        return null;
    }

    private FindIndexById(id: string|null, section: UserMemoryItem[]): number
    {
        return section.findIndex((x) => x.key === id);
    }

    public GetJsonString(): string
    {
        return JSON.stringify(this.data);
    }
}
